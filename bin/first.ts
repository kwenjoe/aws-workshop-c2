#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FirstStack } from '../lib/first-stack';
import { Stack } from '@aws-cdk/core';
import { redisService } from '../lib/redisService';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { VpcEndpointService } from '@aws-cdk/aws-ec2';


const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };
const app = new cdk.App();



const stack = new cdk.Stack(app , 'MyRedis-demo' , {env});

const vpcDemo = ec2.Vpc.fromLookup(stack , "vpc" , {
  vpcId:"vpc-07ed63ae29c333e24"
})
  



const sg = ec2.SecurityGroup.fromSecurityGroupId(stack ,"MySg" , "sg-0324b84b8deef069c" , {})


const cluster = ecs.Cluster.fromClusterAttributes(stack , "MyCluster" , {
  vpc: vpcDemo,
  clusterName:"xxxxx",
  securityGroups: [sg] ,
  clusterArn: "arn:xxxxxx",
})




new redisService(stack , "MyRedis" , {
   HostCluster: cluster,
   efsId : "xxxxx"
});

//new FirstStack(app, 'FirstStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
   //env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
//});
