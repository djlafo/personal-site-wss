const NEXT_URL = process.env.NEXT_ENDPOINT || `http://localhost:3000`;

export async function sendTo(path: string, content: any) {
    const resp = await fetch(`${NEXT_URL}${path}`, {
        method: 'POST',
        body: JSON.stringify(content),
        headers: {
            'authorization': `${process.env.AUTH_SECRET}`
        }
    });
    return resp;
}

export async function getFrom(path: string) {
    const resp = await fetch(`${NEXT_URL}${path}`, {
        headers: {
            'authorization': `${process.env.AUTH_SECRET}`
        }
    });
    return resp;
}