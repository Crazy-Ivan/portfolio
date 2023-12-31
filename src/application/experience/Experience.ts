import { Application } from "../Application";
import { Submarine } from "./submarine/Submarine";
import { Environment } from "./environment/Environment";
import { Map } from "./map/Map";
import { MouseControl } from "../controls/MouseControl";
import { Camera } from "../Camera";
import { Dust } from "./dust/Dust";
import { Obstacle } from "./obstacle/Obstackle";
import { MobileControl } from "../controls/mobile-control/MobileControl";
import { Vector2, Vector3 } from "three";
import { ActiveElements } from "./active-elements/ActiveElements";

export const WORLD_GRAVITY = 0;
export class Experience {
  private environment: Environment;
  private submarine!: Submarine;
  private map!: Map;

  private dust!: Dust;
  private dust2!: Dust;
  private dust3!: Dust;

  private obstacle1!: Obstacle;
  private obstacle2!: Obstacle;

  private activeElements!: ActiveElements;

  private mouseControl: MouseControl;
  private mobileControl: MobileControl;
  private camera: Camera;

  constructor(private application: Application) {
    this.setupPhysicsWorld();

    this.mouseControl = application.mouseControl;
    this.mobileControl = application.mobileControl;
    this.camera = application.camera;

    this.environment = new Environment(this.application);

    this.setupObstacles();
    this.setupSubmarine();
    this.setupMap();
    this.setupDust();
    this.setupActiveElements();

    this.camera.instance.position.x = this.submarine.initialPosition.x;
    this.camera.instance.position.y = this.submarine.initialPosition.y;
  }

  private setupPhysicsWorld() {
    this.application.physicApi.init({
      gravity: [0, WORLD_GRAVITY, 0],
      allowSleep: true,
      broadphase: "SAPBroadphase",
      defaultAngularDamping: 0.2,
      defaultLinearDamping: 0.3,
      defaultLinearFactor: [1, 1, 0],
    });
  }

  private setupActiveElements() {
    this.activeElements = new ActiveElements(
      this.application,
      this.submarine.getReflectorRangeFactor,
      this.submarine.getDistance2D,
    );
  }

  private setupObstacles() {
    this.obstacle1 = new Obstacle(this.application, [25.5, 0, 0]);
    this.obstacle1.init().then(() => {
      this.obstacle1.addInstanceToScene();
    });

    this.obstacle2 = new Obstacle(this.application, [8.5, -29.8, 0]);
    this.obstacle2.init().then(() => {
      this.obstacle2.setPosition(8.5, -29.8, 0);
      this.obstacle2.addInstanceToScene();
    });
  }

  private setupSubmarine() {
    this.submarine = new Submarine(this.application);
    this.submarine.addInstanceToScene();

    //connect obstacles
    this.submarine.on("velocityChange", (velocity) => {
      if (velocity > 6) {
        this.obstacle1.deactivate();
        this.obstacle2.deactivate();
      } else {
        this.obstacle1.activate();
        this.obstacle2.activate();
      }
    });
  }

  private setupSubmarineControls() {
    this.mobileControl.on("start-move", () => {
      this.submarine.startEngine();
    });

    this.mouseControl.on("leftDown", () => {
      this.submarine.startEngine();
    });

    this.mobileControl.on("stop-move", () => {
      this.submarine.stopEngine();
    });

    this.mouseControl.on("leftUp", () => {
      this.submarine.stopEngine();
    });

    this.mobileControl.on("start-power", () => {
      this.submarine.startLoadingExtraPower();
    });

    this.mouseControl.on("rightDown", () => {
      this.submarine.startLoadingExtraPower();
    });

    this.mobileControl.on("stop-power", () => {
      this.submarine.firePowerMove();
    });

    this.mouseControl.on("rightUp", () => {
      this.submarine.firePowerMove();
    });

    this.mouseControl.on("move", () => {
      const submarineDirection = this.mouseControl
        .getCastedPosition()
        .sub(this.submarine.instance.position)
        .normalize();
      this.submarine.setDirection(submarineDirection);
    });

    this.mobileControl.on("joystick-move", (direction: Vector2) => {
      this.submarine.setDirection(new Vector3(direction.x, direction.y, 0));
    });
  }

  private setupMap() {
    this.map = new Map(this.application);
    this.map.init().then(() => {
      this.map.addInstanceToScene();
    });
  }

  private setupDust() {
    this.dust = new Dust(this.application, 30, 15, 7, 450, 2);
    this.dust.addInstanceToScene();
    this.dust.setPosition(-2, 7, 2);

    this.dust2 = new Dust(this.application, 11, 21, 7, 150, 2);
    this.dust2.addInstanceToScene();
    this.dust2.setPosition(3, -8, 2);

    this.dust3 = new Dust(this.application, 45, 60, 7, 650, 3);
    this.dust3.addInstanceToScene();
    this.dust3.setPosition(-10, -29, 2);
  }

  private syncCameraWithSubmarine() {
    const targetCameraPositionY = this.submarine.instance.position.y;
    const targetCameraPositionX = this.submarine.instance.position.x;
    this.camera.instance.position.y +=
      (targetCameraPositionY - this.camera.instance.position.y) * 0.04;
    this.camera.instance.position.x +=
      (targetCameraPositionX - this.camera.instance.position.x) * 0.02;

    if (this.submarine.instance.position.y < -29.5) {
      const targetCameraPositionZ = this.camera.defaultZ + 6;
      const targetFogDensity = 0.03;
      this.camera.instance.position.z +=
        (targetCameraPositionZ - this.camera.instance.position.z) * 0.04;
      this.environment.fogDensity +=
        (targetFogDensity - this.environment.fogDensity) * 0.02;
    } else {
      if (this.camera.instance.position.z > this.camera.defaultZ) {
        const targetCameraPositionZ = this.camera.defaultZ;
        const targetFogDensity = this.environment.defaultFogDensity;
        this.camera.instance.position.z +=
          (targetCameraPositionZ - this.camera.instance.position.z) * 0.04;
        this.environment.fogDensity +=
          (targetFogDensity - this.environment.fogDensity) * 0.02;
      }
    }
  }

  private stepPhysics() {
    this.application.physicApi.step(
      this.application.time.getDeltaElapsedTime(),
    );
  }

  start() {
    this.setupSubmarineControls();
  }

  update() {
    this.stepPhysics();
    this.submarine.update();
    this.obstacle1.update();
    this.obstacle2.update();
    this.activeElements.update();

    this.dust.update();

    if (
      this.submarine.instance.position.y < 0 &&
      this.submarine.instance.position.y > -29.5
    ) {
      this.dust2.update();
    }

    if (this.submarine.instance.position.y < -29.5) {
      this.dust3.update();
    }

    this.syncCameraWithSubmarine();
  }
}
