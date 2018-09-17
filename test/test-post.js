#!/usr/local/bin/node

/*jshint multistr: true */
var fs = require('fs'),
    parser = require('commander'),
    path = require('path'),
    request = require('request');

parser
    .option('-z, --zip <z>', 'Zip file to include', path.resolve(path.join(__dirname, 'default.zip')))
    .option('-p, --port <p>', 'Port number for when -u is local [3000]', '3000')
    .parse(process.argv);

var url = 'http://localhost:{port}/';
url = url.replace('{port}', parser.port);

var note1 =
    `<?xml version='1.0' encoding='UTF-8' ?>
<root>
<fairly>-209999776.49361277</fairly>
<mountain>
  <weak>fair</weak>
  <declared>material</declared>
  <empty>1459949252.211143</empty>
  <edge>
    <military>ready</military>
    <negative>national</negative>
    <curve>due</curve>
    <vast>mental</vast>
    <copy>1638239603</copy>
    <you>meat</you>
  </edge>
  <coffee>434051828</coffee>
  <driver>some</driver>
</mountain>
<hello>908154250</hello>
<fellow>-830219400</fellow>
<soap>-1061247119</soap>
<earth>experiment</earth>
</root>`;


// read zip file into buffer
var zipFileName = path.resolve(parser.zip),
    zipFilePath = path.parse(zipFileName),
    zipFileStream = fs.createReadStream(zipFileName);

    console.log(' POSTING To:  ' + url);
    console.log('zipFileName:  ' + zipFileName);
    console.log('        zip:  ' + JSON.stringify(zipFilePath, null, 2));

var multipart = [
    {
        'Content-Type': 'text/xml; charset=UTF-8',
        'Content-Transfer-Encoding': '8bit',
        body: note1
    },
    {
        'Content-Type': 'application/zip',
        'Content-Transfer-Encoding': 'binary',
        'Content-Disposition': `attachment; filename="${zipFilePath.base}"`,
        body: zipFileStream
    }
];

var postOptions = {
    method: 'POST',
    url: url,
    headers: {
        'Content-Type': 'multipart/related; type=text/xml; start="<start.xml>"; boundary=--MIME_BOUNDARY',
        'Transfer-Encoding': 'chunked'
    },
    time: true,
    multipart: multipart
};

request(postOptions, function (error, response, body) {
    if (error) {
        throw new Error(error);
    }
    console.log(body);
    console.log(response.headers);
    console.log('statusCode:', response.statusCode);
    console.log('elapsedTime:', response.elapsedTime);
});
