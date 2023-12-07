import {Box3, Group, Object3D, Vector3} from "three";
import * as CANNON from "cannon-es";
import {BodyPhysicalHelper} from "../../utils/BodyPhysicalHelper";
import {Application} from "../../Application";

export class Plank {
  private bodyObject3D: Object3D;
  private bodyPhysical: CANNON.Body;
  
  constructor(private application: Application, private model: Object3D) {
    this.bodyObject3D = model;
    this.bodyPhysical = this.createPhysicalBody();
  }
  
  setPosition(x: number, y: number, z: number) {
    this.bodyPhysical.position.set(x, y, z);
    this.model.position.set(x, y, z);
  }

  addInstanceToScene() {
    this.application.scene.add(this.bodyObject3D);
  }

  addBodyToPhysicalWorld() {
    this.application.physicWorld.addBody(this.bodyPhysical);
  }
  
  update() {
    this.bodyObject3D.position.x = this.bodyPhysical.position.x;
    this.bodyObject3D.position.y = this.bodyPhysical.position.y;
    this.bodyObject3D.position.z = this.bodyPhysical.position.z;
    
    this.bodyObject3D.quaternion.x = this.bodyPhysical.quaternion.x;
    this.bodyObject3D.quaternion.y = this.bodyPhysical.quaternion.y;
    this.bodyObject3D.quaternion.z = this.bodyPhysical.quaternion.z;
    this.bodyObject3D.quaternion.w = this.bodyPhysical.quaternion.w;
  }
  
  private createPhysicalBody() {

    const boundingBox = new Box3().setFromObject(this.model);
    const sizeVector = new Vector3();
    boundingBox.getSize(sizeVector);
    
    const box = new CANNON.Box(new CANNON.Vec3(
      sizeVector.x / 2,
      sizeVector.y / 2,
      sizeVector.z / 2));
    


    const body = new CANNON.Body({
      mass: 1,
      shape: box
    });
    
    
    return body;
  }
  
 
}