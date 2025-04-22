import { httpServer } from "./app.js";
import "./utils/socket.js";

httpServer.listen(5000, () => {
    console.log('server is running on port 5000');
});