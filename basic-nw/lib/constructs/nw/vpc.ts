import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";


interface ConstructProps{
    projectName: "basic-env"
}

export class Vpc extends Construct {
    vpc: ec2.IVpc;
    nat: ec2.NatProvider;
    securityGroups: {[name: string]: ec2.ISecurityGroup};
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const projectName = props;
        this.nat = ec2.NatProvider.gateway()
        this.vpc = new ec2.Vpc(this, "vpc", {
            vpcName: 'testBasicVpcArea',
            ipAddresses: ec2.IpAddresses.cidr("10.10.0.0/16"),
            maxAzs: 2,
            subnetConfiguration: [
                {
                    name: "basic-public",
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24
                },
                {
                    name: "basic-private",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24
                }
            ],
            natGatewayProvider: this.nat,
            natGateways: 1,
        });
        this.securityGroups = {
            sshSg: new ec2.SecurityGroup(this, `sshSG-${projectName}`, {
                vpc: this.vpc,
                securityGroupName: `sshSG-${projectName}`,
                allowAllOutbound: true,
                description: 'SSHSecurityGroup'
            }),
            rdsSg: new ec2.SecurityGroup(this, `rdsSG-${projectName}`,{
                vpc: this.vpc,
                securityGroupName: `rdsSG-${projectName}`,
                description: 'rdsSecurityGroup'
            }),
            rdsProxySg: new ec2.SecurityGroup(this, `rdsProxySG-${projectName}`,{
                vpc: this.vpc,
                securityGroupName: `rdsProxySG-${projectName}`,
                description: 'rdsProxySecurityGroup'
            })
        };

        this.securityGroups.sshSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
        this.securityGroups.sshSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing());
        this.securityGroups.sshSg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());
        this.securityGroups.rdsProxySg.addIngressRule(this.securityGroups.sshSg, ec2.Port.tcp(3306));
        this.securityGroups.rdsProxySg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3369));
        this.securityGroups.rdsSg.addIngressRule(this.securityGroups.rdsProxySg, ec2.Port.tcp(3369));
        this.securityGroups.rdsSg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());
    }
}