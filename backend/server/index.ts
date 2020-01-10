import app from "./server";

const port = process.env.PORT || 5000;
process.env.APP_MODE = "web";

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
