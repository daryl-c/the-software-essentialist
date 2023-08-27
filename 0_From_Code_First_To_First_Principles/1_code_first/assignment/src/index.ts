import { myDataSource } from "./app-data-source"
import { app } from './app';

myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((err: unknown) => {
        console.error("Error during Data Source initialization:", err)
    })