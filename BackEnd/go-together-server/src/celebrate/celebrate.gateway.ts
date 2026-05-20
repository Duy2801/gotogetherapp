import { Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { CelebrateService } from "./celebrate.service";

@WebSocketGateway({ path: '/ws/celebrate', cors: true })
export class CelebrateGateway {
  private readonly logger = new Logger(CelebrateGateway.name);

  @WebSocketServer()
  server?: Server;

  constructor(private celebrateService: CelebrateService) {
    // register self so service can emit without importing gateway directly
    try {
      this.celebrateService.setGateway(this);
    } catch (err) {
      this.logger.debug('Unable to set gateway on service: ' + String(err));
    }
  }
}
