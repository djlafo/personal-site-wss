export async function sendTo(path: string, content: any) {
    const resp = await fetch(`http://localhost:3000/${path}`, {
        method: 'POST',
        body: JSON.stringify(content),
        headers: {
            'authorization': `${process.env.AUTH_SECRET}`
        }
    });
    return resp;
}

export async function getFrom(path: string) {
    const resp = await fetch(`http://localhost:3000/${path}`, {
        headers: {
            'authorization': `${process.env.AUTH_SECRET}`
        }
    });
    return resp;
}