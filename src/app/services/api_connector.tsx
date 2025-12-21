async function sendRequest(players: Array<{ level: number, reliability: number }>) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(convertBodyToRequest(players))
    };
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PPC_API_URL}/get-probability`, requestOptions);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Request failed');
        }
    } catch (error) {
        return error;
    }
}

function convertBodyToRequest(players: Array<{ level: number, reliability: number }>) {
    let requestBody: { [key: string]: number } = {};

    players.forEach((player, index) => {
        const newPlayer: { [key: string]: number } = {};
        newPlayer[`player${index+1}_level`] = player.level;
        newPlayer[`player${index+1}_reliability`] = player.reliability;
        requestBody = { ...requestBody, ...newPlayer };
    });

    return requestBody;
}

export default sendRequest;
