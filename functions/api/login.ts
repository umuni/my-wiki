export const onRequestPost: PagesFunction<{ "MY-WIKI_DB": D1Database }> = async (context) => {
    const { request, env } = context;

    try {
        const { username, password } = await request.json();

        // 1. Get user from DB
        const user = await env["MY-WIKI_DB"].prepare(
            "SELECT password_hash FROM users WHERE username = ?"
        ).bind(username).first();

        if (!user) {
            return new Response("Invalid username or password", { status: 401 });
        }

        // 2. Verify password
        // Note: Matching register.ts implementation which stores passwords directly.
        // In production, consider using proper hashing.
        if (user.password_hash !== password) {
            return new Response("Invalid username or password", { status: 401 });
        }

        // 3. Set Cookie and return success
        // Middleware checks for "auth_token=valid"
        const headers = new Headers();
        headers.set("Set-Cookie", "auth_token=valid; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400");
        headers.set("Content-Type", "application/json");

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: headers
        });

    } catch (err) {
        console.error("Login error:", err);
        return new Response("Login failed", { status: 500 });
    }
};
