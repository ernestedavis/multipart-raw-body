import * as express from "express";
import { Router } from "./router";

class App {

    public app: express.Application;
    public router: Router = new Router();

    constructor() {
        this.app = express();
        this.config();
        this.router.routes(this.app);
    }

    private config(): void {
    }

}

export default new App().app;