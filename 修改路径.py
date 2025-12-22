import os
import re

# 配置你的 content 绝对路径
CONTENT_DIR = r"E:\Blog\my-wiki\quartz\content"

def repair_paths():
    # 匹配 Markdown 图片语法: ![alt](./filename.assets/image.png)
    img_pattern = re.compile(r'!\[(.*?)\]\(\./(.*?\.assets)/(.*?)\)')
    
    for root, dirs, files in os.walk(CONTENT_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                # 计算当前文件夹相对于 content 的路径
                rel_dir = os.path.relpath(root, CONTENT_DIR).replace("\\", "/")
                
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # 核心替换逻辑：将 ./ 替换为 /路径/
                # 结果类似于: ![alt](/04-性能测试/01-理论/jmeter.assets/001.png)
                new_content = img_pattern.sub(f'![\\1](/{rel_dir}/\\2/\\3)', content)
                
                if content != new_content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"✅ 已修复: {file}")

if __name__ == "__main__":
    repair_paths()
    print("🚀 所有图片路径已转换为根目录绝对路径，Quartz 现在可以 100% 识别了。")