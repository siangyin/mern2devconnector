const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

//connect DB
connectDB()

app.get("/", (req, res) => {
	res.send(`API running`);
});
app.listen(PORT, () => {
	console.log(`server on ${PORT}`);
});
