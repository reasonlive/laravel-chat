import { configureEcho, echo } from "@laravel/echo-react";
import { getApiRootPath } from "./api";
import Echo, {BroadcastDriver} from "laravel-echo";

enum Connection {
    SHUTDOWN,
    ON,
    OFF,
    DISCONNECT
}

export default class EchoService {
    private dataHandler: Function = (data: any) => console.log(data);
    public constructor(private channel: string, private event: string) {
        this.init()
    }

    public listen(): Echo<BroadcastDriver> {
        return this.plug(this.channel, this.event, Connection.ON)
    }

    public close(): Echo<BroadcastDriver> {
        return this.plug(this.channel, this.event, Connection.OFF)
    }

    public setDataHandler(callback: Function): EchoService {
        this.dataHandler = callback;
        return this;
    }

    private init(){
        configureEcho({
            broadcaster: "reverb",
            key: 'frontws',
            //cluster: 'mt1',
            authEndpoint: getApiRootPath() + '/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                }
            },
            wsHost: 'localhost',
            wsPort: 8080,
            //wssPort: 443,
            enabledTransports: ["ws", "wss"],
            forceTLS: false
        })
    }

    private plug(channel: string, event: string, connection: Connection): Echo<BroadcastDriver> {

        switch (connection) {
            case Connection.SHUTDOWN:
                echo().leaveAllChannels();
                break;
            case Connection.ON:
                echo().listen(channel, event, (data: any) => {
                    this.dataHandler(data);
                });
                break;
            case Connection.OFF:
                echo().leave(channel);
                break;
            case Connection.DISCONNECT:
                echo().leaveChannel(channel);
                break;
            default:
                return echo();
        }

        return echo();
    }
}
