const express = require("express");
const app = express();

const stripe = require("stripe")(
  // This is your test secret API key.
  'sk_test_51QRjvzFsSCS8qxJlnPMOFyA5cNXWUitIZUF3qsXQLUfAT95QvbOEWPqKR5s6ttKJceixq6iIe2Tbke1apkv5rxjc00xMeyHQjJ',
  {
    apiVersion: "2023-10-16",
  }
);

app.use(express.static("dist"));
app.use(express.json());

app.post("/account_session", async (req, res) => {
  try {
    const { account } = req.body;

    const accountSession = await stripe.accountSessions.create({
      account: account,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    res.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.post("/account", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "none",
        },
        fees: {
          payer: "application"
        },
        losses: {
          payments: "application"
        },
        requirement_collection: "application",
      },
      capabilities: {
        transfers: {requested: true}
      },
      country: "MX",
    });

    res.json({
      account: account.id,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account",
      error
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.get("/*", (_req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.listen(4242, () => console.log("Node server listening on port 4242! Visit http://localhost:4242 in your browser."));