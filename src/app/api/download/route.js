import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'download';

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer',
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Determine final filename with extension
        let finalFilename = filename;
        const urlPath = new URL(url).pathname;
        const extension = urlPath.split('.').pop();

        // If filename doesn't already have this extension, append it
        if (extension && !finalFilename.toLowerCase().endsWith('.' + extension.toLowerCase())) {
            finalFilename = `${finalFilename}.${extension}`;
        }

        const contentType = response.headers['content-type'] || 'application/octet-stream';

        return new NextResponse(response.data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${finalFilename}"`,
            },
        });
    } catch (error) {
        console.error('Download error for URL:', url);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
        return NextResponse.json({ error: 'Failed to download file', details: error.message }, { status: 500 });
    }
}
