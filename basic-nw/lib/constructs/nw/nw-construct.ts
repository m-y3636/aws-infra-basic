import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Vpc } from "./vpc";

interface ConstructProps {
	projectName: "basic-env"
}


export class nwConstruct extends Construct {
	vpc: Vpc;
	constructor(scope: Construct, id: string, props: ConstructProps){
		super(scope, id);
		this.vpc = new Vpc(this, "vpc-nw", {projectName: "basic-env"});
	}
}