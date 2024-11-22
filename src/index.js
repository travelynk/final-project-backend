import { config } from "dotenv";
config();

import express, { json, urlencoded } from "express";
import morgan from 'morgan';
const app = express();

const PORT = process.env.PORT;

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(morgan('combined'));

// app.get('/', async (req, res) => {
//     try {
//         res.send('testing');
//     } catch (error) {
//         res.status(500).send('Internal Server Error');
//     }
// });


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});