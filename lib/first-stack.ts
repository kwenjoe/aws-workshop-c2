import * as cdk from '@aws-cdk/core';
import * as patterns from 'cdk-fargate-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as path from 'path';
import * as certManager from '@aws-cdk/aws-certificatemanager';
export class FirstStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const cert = certManager.Certificate.fromCertificateArn(this, 'MyCert' , 'arn:xxxxxx');


    const nginxTask = new ecs.FargateTaskDefinition(this, 'Task' , {
      cpu:256,
      memoryLimitMiB:512
    })

    nginxTask.addContainer('nginx' , {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname , '../src/DemoService')),
      portMappings:[{
          containerPort:80,         

      }]
    })

    new patterns.DualAlbFargateService(this, 'DemoService',{
      tasks:[
        {
          task: nginxTask,
          external:{
            port:443 , 
            certificate: [cert]

          },
          internal:{
            port:80
          }
        }
      ]

    });
    // The code that defines your stack goes here
  }
}
