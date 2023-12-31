import { MouseControl } from "./controls/MouseControl";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { Scene } from "three";
import { Sizes } from "./utils/Sizes";
import { Time } from "./utils/Time";
import * as dat from "dat.gui";
import Stats from "stats.js";
import { Sound } from "./Sound";

import { Experience } from "./experience/Experience";
import { MobileControl } from "./controls/mobile-control/MobileControl";
import Tween from "@tweenjs/tween.js";
import { PhysicApi } from "./physic/PhysicApi.js";

export class Application {
  mouseControl: MouseControl;
  mobileControl: MobileControl;
  scene: Scene;
  physicApi: PhysicApi;
  sizes: Sizes;
  camera: Camera;
  renderer: Renderer;
  experience: Experience;
  time: Time;
  sound: Sound;
  debug?: dat.GUI;
  stats?: Stats;

  constructor() {
    if (location.hash === "#debug") {
      this.setDebug();
    }

    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new Scene();
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.physicApi = new PhysicApi();
    this.sound = new Sound(this);
    this.mouseControl = new MouseControl(this);
    this.mobileControl = new MobileControl(this);
    this.experience = new Experience(this);

    this.adjustFOV();
    this.time.on("tick", this.update);
    this.sizes.on("resize", this.resize);
  }

  private adjustFOV = () => {
    if (this.sizes.aspectRatio < 1) {
      this.camera.instance.fov = 80;
      this.camera.instance.updateProjectionMatrix();
    } else {
      this.camera.instance.fov = this.camera.defaultFOV;
      this.camera.instance.updateProjectionMatrix();
    }
  };

  setDebug() {
    this.stats = new Stats();
    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);

    this.debug = new dat.GUI({ width: 280 });

    this.debug.domElement.onmouseenter = () => {
      this.mouseControl.disable();
    };
    this.debug.domElement.onmouseleave = () => {
      this.mouseControl.enable();
    };

    this.debug.close();
  }

  start() {
    this.time.start();
    this.renderer.renderer.compile(this.scene, this.camera.instance);
  }

  experienceStart(enableTouchInterface = false) {
    this.experience.start();
    this.sound.init();

    if (enableTouchInterface) {
      this.mobileControl.enable();
    }
  }

  resize = () => {
    this.camera.resize();
    this.renderer.resize();
    this.adjustFOV();
  };

  update = () => {
    this.stats?.begin();
    Tween.update();
    this.mouseControl.updateRaycaster();
    this.experience.update();
    this.renderer.update();
    this.stats?.end();
  };
}
