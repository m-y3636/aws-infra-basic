import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ec2Server } from "./server";
import { ConnectionType } from "aws-cdk-lib/aws-apigateway";


interface ConstructProps{
    projectName: "basic-env";
    vpc: ec2.IVpc;
    securityGroups: { [name: string]: ec2.ISecurityGroup };
}

export class cpConstructs extends Construct {
    instance: ec2Server;
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const { projectName, vpc, securityGroups } = props;
        this.instance = new ec2Server(this, 'Ec2Server',{
            projectName: projectName,
            vpc: vpc,
            securityGroups: securityGroups
        })
    }
}