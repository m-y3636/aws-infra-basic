import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { nwConstruct } from './constructs/nw/nw-construct';
import { cpConstructs } from './constructs/computes/cp-constructs';
import { dbConstruct } from './constructs/DB/db-construct';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BasicNwStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // ===================================================================
    // basicNetWorks: npc, subnet, securityGroups
    const nw = new nwConstruct(this, nwConstruct.name, {projectName: 'basic-env'});

    // ===================================================================
    // basicComputing: ec2, lambda, ecs
    const cp = new cpConstructs(this, 'cpConst', {
      projectName: 'basic-env',
      vpc: nw.vpc.vpc,
      securityGroups: nw.vpc.securityGroups
    });

    // ===================================================================
    // basicDB: rds, redshift, dynamoDB
    const rds = new dbConstruct(this, 'dbConst', {
      vpc: nw.vpc.vpc,
      securityGroups: nw.vpc.securityGroups 
    })
    // ===================================================================
    // CICDservice: codepipeline, codecommit, codestar, codebuild, codedeploy
  }
}
