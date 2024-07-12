import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import { ConnectionType } from "aws-cdk-lib/aws-apigateway";


interface ConstructProps{
    projectName: "basic-env";
    vpc: ec2.IVpc;
    securityGroups: {[name: string]: ec2.ISecurityGroup }
}

export class Ec2 extends Construct{
    ec2_instance: ec2.Instance;
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const { projectName, vpc } = props;
        const cloud9_instance = new cloud9.CfnEnvironmentEC2(this, 'cloud9Instance', {
            name: 'cloud9Instance',
            instanceType: 't2.micro',
            connectionType: 'ssh',
            description: 'the instance for cloud9',
        });
    }
}

export class ec2Server extends Construct {
    ec2_instance: ec2.IInstance;
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const {projectName, vpc , securityGroups} = props;
        this.ec2_instance = new ec2.Instance(this, 'target_instance', {
            instanceName: 'ec2_instance',
            vpc: vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux2023(
                { cachedInContext: true }
            ),
            // machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023}),
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC},
            ssmSessionPermissions: true,
            securityGroup: securityGroups.sshSg
        });
    }
}