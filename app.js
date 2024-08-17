const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', pageRoutes);

// ... (any other middleware or configuration)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
