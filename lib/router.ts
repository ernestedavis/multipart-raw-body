import { NextFunction, Request, Response } from "express";
import * as formidable from "formidable";
import * as fs from "fs";
import * as _ from "lodash";
import * as moment from "moment";
import * as os from "os";
import * as path from "path";

export class Router {

    public routes(app): void {

        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                })
            })
            // POST endpoint
            .post(_handlePost)
            .put((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'PUT request successfulll!!!!'
                })
            })

    }
}

async function _handlePost(req: Request, res: Response, next: NextFunction) {
    if (!req.headers ||
        !req.headers["content-type"] ||
        !req.headers["content-type"].startsWith("multipart")) {

        res.status(415).send({
            message: 'Unsupported Media Type'
        })
        return next();
    }

    try {
        // store the name of the raw-body file in the request
        const rawBodyFileName = path.normalize(path.join(os.tmpdir(), "raw-body-" + moment.utc(moment()).format("YYYYMMDDHHmmss") + "-raw.txt"));
        Object.assign(req, { rawRequestBodyFile: rawBodyFileName });

        // NOTE: code below parses the stream.Readable in the request twice:
        //
        // 1) first to write raw request body
        // (DO NOT WAIT. formidable will not see the entire body if this waits.)
        _writeRawRequestBody(req, rawBodyFileName);

        // 2) second by formidable to parse into an object structure
        // DO WAIT for formidable to finish so the fields & files will be added to the request
        await _formidableParse(req);

    } catch (err) {
        console.error("Error processing multipart form:\n", err);
        res.status(500).send({
            message: `Error processing multipart form: ${err}`
        })
    }

    console.debug("results of formidable parse:\n" + JSON.stringify({ 
        fields: _.get(req, "fields"),
        files: _.get(req, "files")
    }, null, 2));

    res.status(200).send({
        message: 'POST request successfulll!!!!'
    })
    next();
}

async function _writeRawRequestBody(req: Request, fqFilename: string): Promise<string> {
    console.debug("writing raw request body to: ", fqFilename);

    const writeStream = fs.createWriteStream(fqFilename);

    req
        .on("error", (err) => {
            console.error("Error reading request data:\n", err);
            throw (err);
        })
        .on("aborted", () => {
            console.error("Aborted while reading request data");
            throw (Error("Aborted while reading request data"));
        })
        .on("data", (buffer: Buffer) => {
            writeStream.write(buffer);
        })
        .on("end", () => {
            writeStream.end();
            console.debug("finished writing raw request body to: ", fqFilename);
        });
    return fqFilename;
}

async function _formidableParse(req: any): Promise<any> {
    console.debug("BEGIN parsing request body with formidable")

    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.multiples = true;

        form.parse(req, (err: any, fields: any, files: any) => {
            if (err) {
                console.error(`Error parsing multipart request: ${err}`);
                reject(err);
            } else {
                Object.assign(req, {
                    fields,
                    // formidable oddity: "files.null", not "files" like you might expect
                    files: Array.isArray(files.null) ? files.null : [files.null],
                });
                console.debug("END parsing request body with formidable")

                resolve();
            }
        });
    });
}