async function run() {
  try {
    console.log("Logging in as greymatter...");
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "greymatter",
        password: "1234",
      }),
    });

    console.log("Login status:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Login data:", loginData);

    const setCookie = loginRes.headers.get("set-cookie");
    console.log("Set-Cookie:", setCookie);

    const headers = {};
    if (setCookie) {
      headers["Cookie"] = setCookie.split(";")[0];
    }

    console.log("Fetching private friends...");
    const friendsRes = await fetch("http://localhost:5000/api/echoLink/friends/private", {
      headers,
    });
    console.log("Friends status:", friendsRes.status);
    const friendsText = await friendsRes.text();
    console.log("Friends body:", friendsText);

  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

run();
