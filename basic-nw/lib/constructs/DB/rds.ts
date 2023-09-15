import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { VpcSubnetGroupType } from 'aws-cdk-lib/cx-api';


interface ConstructProps {
    vpc: ec2.IVpc
}

declare const secrets: secretsmanager.Secret[]


// RDSSet
export class RdsSet extends Construct {
    rds_cluster: rds.IDatabaseCluster;
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const { vpc } = props;
        // ===================================================================
        // rdsCredentialsSecret
        // まずシークレットを設定して、Credentialの設定値とする。
        const rdsCredentialsSecret = new secretsmanager.Secret(this, 'rdsCredentialsSecret', {
            description: 'secretsForRdsAndProxy',
            secretName: id + 'CredentialsSecret',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'clusterAdmin' }),
                generateStringKey: 'password',
                excludePunctuation: true,
                includeSpace: false,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // ===================================================================
        // RDSCluster
        const rdsCred = rds.Credentials.fromSecret(rdsCredentialsSecret);
        this.rds_cluster = new rds.DatabaseCluster(this, 'rds_cluster', {
            engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_03_0 }),
            writer: rds.ClusterInstance.provisioned('writer', {
                instanceType: ec2.InstanceType.of(ec2.InstanceClass.R5, ec2.InstanceSize.LARGE)
            }),
            readers: [
                // will be put in promotion tier 1 and will scale with the writer
                rds.ClusterInstance.serverlessV2('reader1', { scaleWithWriter: true }),
                // will be put in promotion tier 2 and will not scale with the writer
                rds.ClusterInstance.serverlessV2('reader2'),
            ],
            serverlessV2MaxCapacity: 64,
            serverlessV2MinCapacity: 6.5,
            // credentials: rds.Credentials.fromGeneratedSecret('clusterAdmin'),
            credentials: rdsCred,
            vpc: vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        });
        // ===================================================================
        // RDSProxy
        // RDSProxy iam for secrets manager
        // RDSProxy main
        const proxy = new rds.DatabaseProxy(this, 'proxy', {
            dbProxyName: "basicProxy",
            proxyTarget: rds.ProxyTarget.fromCluster(this.rds_cluster),
            secrets: [rdsCredentialsSecret],
            vpc
        })
    }
}