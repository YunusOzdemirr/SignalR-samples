

var token2 = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJlbWFpbCI6Inl1bnVzb3pkZW1pcjQ2OEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoic3RyaW5nIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlcGhvbmUiOiI1MzkzMTg2ODY0IiwiSXBBZGRyZXNzIjoiOjoxIiwiSXNEZWxldGVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwibmJmIjoxNjUzNTQ4Mzk3LCJleHAiOjE2NTM1NjgxOTcsImlzcyI6Ill1bnVzQHl1bnVzLmNvbSIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjMwMDAifQ.cSauYSq7JxvyO13C8LPQdq-o51Gf4KdeU4x-GH5ZwB8";

const connection2 = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7250/portfolio?access_token=" + token2, {

        //.withUrl("https://fahax.xyz/portfolio?access_token=" + token, {
        //.withUrl("https://localhost:7250/binance", {
        skipNegotiation: true,
        //transport: 'ServerSentEvents',

        transport: signalR.HttpTransportType.WebSockets,

        //   accessTokenFactory: () =>

    })
    .build();

async function start() {
    try {
        connection2.start().then(function () {
            console.log("SignalR Connected.");
            startStreaming();

        });
    } catch (err) {
        console.log(err);
    }
};

connection2.onclose(async () => {
    console.log("Kapandı");
    //await start();
});

// Start the connection2.
start();


function startStreaming() {
    console.log("Stream Çalıştı.");
    connection2.stream("DataStream", 500)
        .subscribe({
            next: (item) => {
                console.log(item)
                //item.forEach((coin) => {

                //    displayStock(coin);
                //});

            },
            complete: () => {
                console.log(item);
            },
            error: (err) => {
                console.log("Hata var: " + err);
            },
        });
}
