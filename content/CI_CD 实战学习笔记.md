# Jenkins CI/CD 实战学习笔记



这份学习笔记将从 **Jenkins 核心概念、环境搭建、Pipeline 实战三个维度为你梳理一套完整的 CI/CD 部署体系。以下实战结合杭州萧山飞行区部分服务进行，当jekins监测到gitlab上的项目main分支代码有更新时，自动启动打包编译部署流程，为保证部署成功或失败时，能更直观的进行自动化提示，我加入了服务重启后对日志的关键词监控，根据获取到的关键词来识别是否部署成功并及时通过钉钉机器人进行消息通知。

Jenkins 是 CI/CD（持续集成/持续部署）体系中的“调度员”。其核心价值在于通过 **Pipeline as Code（代码化流水线）**，将代码拉取、编译、测试、镜像构建及远程部署等碎片化动作自动化，实现软件交付的标准化与可追溯。

* * *

一、 环境准备与基础配置
------------

1\. 安装方式建议
----------

*   **容器化部署（推荐）：** 使用 Docker 部署，便于维护和迁移。
    ```
    docker run -d -p 8080:8080 -p 50000:50000 --name jenkins \
    -v /var/jenkins_home:/var/jenkins_home \
    -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins:lts
    ```
*   **核心配置：**
    *   **凭据管理 (Credentials)：** 存储 Git 仓库 Token、服务器 SSH 密钥、Docker Hub 账号。
    *   **插件中心：** 必装 `Pipeline`、`Git`、`Docker`、`SSH Agent`、`Blue Ocean`。

2\. 主从架构 (Master-Slave)
-----------------------

为了提高构建效率和安全性，建议 Master 只负责任务调度，具体的 Build 任务交给 **Agent（节点）** 执行。

* * *

二、 关键组件：Jenkins Pipeline
------------------------

Pipeline 是 Jenkins 的灵魂，通常使用 `Jenkinsfile` 编写

* * *

三、 CICD 项目部署实战步骤
----------------

1\. 触发机制
--------

*   **Webhook 触发：** 代码提交到 GitLab/GitHub 后，自动通知 Jenkins 启动任务。
*   **定时触发：** 适用于耗时较长的集成测试（如：`H H/2 * * *` 每两小时执行一次）。

2\. 自动化构建与测试
------------

*   **代码扫描：** 集成 **SonarQube**，在 Build 阶段进行静态代码分析，若质量门禁（Quality Gate）不通过，直接熔断 Pipeline。
*   **单元测试：** 自动生成 JUnit 报表，查看测试覆盖率。

3\. 多环境部署实战
-----------

利用 **Parameters（参数化构建）**，一份 Jenkinsfile 适配不同环境。

*   **开发环境 (Dev)：** 代码提交即部署。
*   **测试环境 (Staging)：** 自动化测试通过后部署。
*   **生产环境 (Prod)：** 增加 **Input 确认环节**，需要人工点击“批准”方可发布。

* * *

三、 全流程运转逻辑梳理
------------

当配置完成后，整个系统的运转逻辑如下：

1.  开发人员在本地完成功能，将代码 Push 到功能分支，并发起 Merge Request。
2.  代码被 Code Review 通过并**合并进入 `main` 分支**。
3.  GitLab 检测到 `main` 分支的 Push 事件，向 Jenkins 发送 HTTP POST 请求。
4.  Jenkins 验证请求合法后，启动上述的 `Jenkinsfile` 任务。
5.  Jenkins 读取环境变量配置，使用 Maven/Npm 编译出产物。
6.  Jenkins 执行 `docker build` 将产物封装成一个带有当前构建号（如 `v42`）的新镜像。
7.  Jenkins 执行 Shell 脚本，强制停止并销毁旧的 `${CONTAINER_NAME}` 容器。
8.  Jenkins 立刻使用新构建的镜像启动同名容器，完成镜像和服务的原地更新。

* * *

笔记总结点梳理
-------

1.  **容错性设计**：脚本中大量使用了 `|| true`（如 `docker stop ... || true`），这是为了防止在第一次部署（没有任何旧容器或旧镜像）时，流水线因为找不到目标而报错中断。
2.  **变量分离**：将 IP、路径、服务名提取到 `environment` 块中。如果未来你们新增了服务器或者修改了部署路径，只需要在顶部修改一处即可，不用去复杂的 Shell 脚本里大海捞针。
3.  **闭环思维**：从拉取代码到传输、备份、启动，最后不忘加上 `find ... -exec rm ...` 清理过期的历史备份。这就形成了一个不需要人工干预、不会产生资源泄漏的完整闭环。

第一步：在钉钉群创建机器人并获取 Webhook
------------------------

1.  在目标钉钉群设置中，添加“自定义机器人”。
2.  **安全设置**：推荐选择“自定义关键词”，并设置关键词为“**部署**”或“**通知**”（注意：你之后通过代码发送的消息内容中，必须包含这个词，否则钉钉会拦截不发）。
3.  复制生成的 **Webhook URL**。

第二步：将 `post` 块加入 Jenkinsfile
----------------------------

* * *

Pipeline：
-------------------

```
pipeline {
    // 【修正点 1】：全局恢复 any，统筹全局并拉取代码
    agent any 
    
    environment {
        SERVER_IP        = "192.168.200.206"
        DEPLOY_USER      = "root"
        
        BASE_DIR         = "/home/data/project/hz-xsfjc"
        JAR_BIZ_DIR      = "${BASE_DIR}/jar"
        JAR_ARK_DIR      = "${BASE_DIR}/jar1"
        DIST_DIR         = "${BASE_DIR}/dist"
        
        // (注：在真实的公网环境中，请尽量使用 Jenkins 凭据库来隐藏这个 Token，防止泄露)
        DINGTALK_WEBHOOK = "https://oapi.dingtalk.com/robot/send?access_token=8c14a4d7250025cfc2ff4c0a721cb3ce945c80675f2ae8f080842bcedf3bf2a2"
    }

    stages {
        stage('检出代码 (Checkout)') {
            steps {
                echo "开始从代码库拉取最新代码..."
                git branch: 'main', 
                    credentialsId: 'your-git-credentials-id', 
                    url: 'https://github.com/your-org/hz-xsfjc.git'
            }
        }

        stage('编译与部署 (Build & Deploy)') {
            parallel {
                // ------------------------------------------
                // 任务 A：部署 hz-inspection-business
                // ------------------------------------------
                stage('Deploy Inspection Business') {
                    // 【修正点 2】：只在这个任务中启动 Maven 纯净容器
                    agent {
                        docker {
                            image 'maven:3.8.1-jdk-11'
                            reuseNode true // 关键：复用外层 agent 的工作区，确保能读到刚拉下来的代码
                            args '-v /var/jenkins_home/maven_cache/.m2:/root/.m2'
                        }
                    }
                    when { changeset "inspection-business-src/**" }
                    steps {
                        echo "【后台】开始编译 hz-inspection-business..."
                        dir('inspection-business-src') { sh 'mvn clean package -DskipTests' }
                        
                        sshagent(credentials: ['your-server-key']) {
                            sh """
                                export SSH_OPTS="-o StrictHostKeyChecking=no"
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} 'mkdir -p /tmp/jenkins_deploy/jar'
                                scp \$SSH_OPTS inspection-business-src/target/inspection-business-1.0.0.jar ${DEPLOY_USER}@${SERVER_IP}:/tmp/jenkins_deploy/jar/
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} '
                                    cd ${JAR_BIZ_DIR}
                                    TIMESTAMP=\$(date +"%m%d%H%M")
                                    
                                    if [ -f "inspection-business-1.0.0.jar" ]; then
                                        cp inspection-business-1.0.0.jar inspection-business-1.0.0-\${TIMESTAMP}.jar
                                    fi
                                    mv -f /tmp/jenkins_deploy/jar/inspection-business-1.0.0.jar ./
                                    
                                    cd ${BASE_DIR}
                                    docker stop hz-inspection-business-8550 || true
                                    docker rm hz-inspection-business-8550 || true
                                    docker rmi hz-inspection-business:\${BUILD_ID:-1.0.0} || true 
                                    
                                    export APP_VERSION=\${BUILD_ID}
                                    docker-compose up -d --build hz-inspection-business
                                    
                                    find ${JAR_BIZ_DIR} -name "inspection-business-1.0.0-*.jar" -type f -mtime +90 -exec rm -f {} \\;
                                    
                                    echo "等待服务启动..."
                                    sleep 20
                                    LOGS=\$(docker logs --tail=500 hz-inspection-business-8550 2>&1)
                                    if echo "\$LOGS" | grep -qE "Exception|ERROR"; then
                                        echo "❌ 启动失败：检测到严重错误日志！"
                                        docker logs --tail=50 hz-inspection-business-8550
                                        exit 1
                                    else
                                        echo "✅ 日志检查通过，服务启动正常。"
                                    fi
                                '
                            """
                        }
                    }
                }

                // ------------------------------------------
                // 任务 B：部署 hz-ark-file-engine
                // ------------------------------------------
                stage('Deploy Ark File Engine') {
                    // 同理，文件引擎也单独使用 Maven 容器
                    agent {
                        docker {
                            image 'maven:3.8.1-jdk-11'
                            reuseNode true
                            args '-v /var/jenkins_home/maven_cache/.m2:/root/.m2'
                        }
                    }
                    when { changeset "ark-file-engine-src/**" }
                    steps {
                        echo "【引擎】开始编译 hz-ark-file-engine..."
                        dir('ark-file-engine-src') { sh 'mvn clean package -DskipTests' }
                        
                        sshagent(credentials: ['your-server-key']) {
                            sh """
                                export SSH_OPTS="-o StrictHostKeyChecking=no"
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} 'mkdir -p /tmp/jenkins_deploy/jar1'
                                scp \$SSH_OPTS ark-file-engine-src/target/ark-file-engine-1.0.0.jar ${DEPLOY_USER}@${SERVER_IP}:/tmp/jenkins_deploy/jar1/
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} '
                                    cd ${JAR_ARK_DIR}
                                    TIMESTAMP=\$(date +"%m%d%H%M")
                                    
                                    if [ -f "ark-file-engine-1.0.0.jar" ]; then
                                        cp ark-file-engine-1.0.0.jar ark-file-engine-1.0.0-\${TIMESTAMP}.jar
                                    fi
                                    mv -f /tmp/jenkins_deploy/jar1/ark-file-engine-1.0.0.jar ./
                                    
                                    cd ${BASE_DIR}
                                    docker stop hz-ark-file-engine-8551 || true
                                    docker rm hz-ark-file-engine-8551 || true
                                    docker rmi hz-ark-file-engine:\${BUILD_ID:-1.0.0} || true 
                                    
                                    export APP_VERSION=\${BUILD_ID}
                                    docker-compose up -d --build hz-ark-file-engine
                                    
                                    find ${JAR_ARK_DIR} -name "ark-file-engine-1.0.0-*.jar" -type f -mtime +90 -exec rm -f {} \\;
                                    
                                    sleep 20
                                    LOGS=\$(docker logs --tail=500 hz-ark-file-engine-8551 2>&1)
                                    if echo "\$LOGS" | grep -qE "Exception|ERROR"; then
                                        echo "❌ 启动失败：检测到严重错误日志！"
                                        exit 1
                                    else
                                        echo "✅ 日志检查通过，服务启动正常。"
                                    fi
                                '
                            """
                        }
                    }
                }

                // ------------------------------------------
                // 任务 C：部署前端静态资源 dist
                // ------------------------------------------
                stage('Deploy Frontend Dist') {
                    // 【修正点 3】：前端任务启用包含 npm 的 Node 容器
                    agent {
                        docker {
                            image 'node:16'
                            reuseNode true
                        }
                    }
                    when { changeset "frontend-src/**" }
                    steps {
                        echo "【前端】开始打包静态资源..."
                        dir('frontend-src') { 
                            // node:16 容器默认可能没有 zip 命令，若打包报错可加上 apt-get update && apt-get install -y zip
                            sh 'npm install && npm run build'
                            sh 'apt-get update && apt-get install -y zip && zip -r dist.zip dist' 
                        }
                        
                        sshagent(credentials: ['your-server-key']) {
                            sh """
                                export SSH_OPTS="-o StrictHostKeyChecking=no"
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} 'mkdir -p /tmp/jenkins_deploy/dist'
                                scp \$SSH_OPTS frontend-src/dist.zip ${DEPLOY_USER}@${SERVER_IP}:/tmp/jenkins_deploy/dist/
                                
                                ssh \$SSH_OPTS ${DEPLOY_USER}@${SERVER_IP} '
                                    cd ${DIST_DIR}
                                    TIMESTAMP=\$(date +"%m%d%H%M")
                                    
                                    if [ -f "dist.zip" ]; then
                                        cp dist.zip dist-\${TIMESTAMP}.zip
                                    fi
                                    if [ -d "dist" ]; then
                                        mv dist dist_backup_\${TIMESTAMP}
                                    fi
                                    
                                    mv -f /tmp/jenkins_deploy/dist/dist.zip ./
                                    unzip -q dist.zip
                                    
                                    docker restart hz-nginx-8090
                                    
                                    find ${DIST_DIR} -name "dist-*.zip" -type f -mtime +90 -exec rm -f {} \\;
                                    find ${DIST_DIR} -name "dist_backup_*" -type d -mtime +90 -exec rm -rf {} \\;
                                '
                            """
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // 阶段三：钉钉播报 (全局状态收尾)
    // ==========================================
    post {
        success {
            echo "所有微服务部署且健康检查通过，发送【通知】..."
            // 【修正点 4】：使用 \\n\\n 防止 JSON 格式化断裂
            sh """
                curl -H "Content-Type: application/json" -X POST -d '{
                    "msgtype": "markdown",
                    "markdown": {
                        "title": "部署成功通知",
                        "text": "### 🚀 服务部署成功通知\\n\\n**项目名称**: ${JOB_NAME}\\n\\n**构建编号**: #${BUILD_NUMBER}\\n\\n**状态**: ✅ **SUCCESS**\\n\\n**详情**: 变更代码已完成原子替换，Docker服务组重启完毕，且日志健康检查未见异常。\\n\\n[🔍 点击查看构建日志](${BUILD_URL})"
                    }
                }' \${DINGTALK_WEBHOOK}
            """
        }
        
        failure {
            echo "存在任务中断或健康检查失败，发送【告警】..."
            sh """
                curl -H "Content-Type: application/json" -X POST -d '{
                    "msgtype": "markdown",
                    "markdown": {
                        "title": "部署失败告警",
                        "text": "### 🚨 服务部署失败告警\\n\\n**项目名称**: ${JOB_NAME}\\n\\n**构建编号**: #${BUILD_NUMBER}\\n\\n**状态**: ❌ **FAILURE**\\n\\n**警告**: 流水线异常中断！可能是代码编译失败，或容器启动日志中检测到了 `Exception`/`ERROR`。\\n\\n[⚠️ 点击立即排查报错明细](${BUILD_URL})"
                    },
                    "at": {
                        "isAtAll": true
                    }
                }' \${DINGTALK_WEBHOOK}
            """
        }
    }
}
```



---
