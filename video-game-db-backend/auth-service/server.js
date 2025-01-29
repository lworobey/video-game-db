const authRoutes = require('./routes/authRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes); // Register auth routes under '/auth'

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
