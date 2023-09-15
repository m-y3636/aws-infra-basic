import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RdsSet } from './rds';

interface ConstructProps{
    vpc: ec2.IVpc;
    securityGroups: { [name: string]: ec2.ISecurityGroup };
}


export class dbConstruct extends Construct{
    rds_cluster: RdsSet;
    constructor(scope: Construct, id: string, props: ConstructProps){
        super(scope, id);
        const { vpc } = props;
        this.rds_cluster = new RdsSet(this, 'rdsClass', { vpc });
    }
}