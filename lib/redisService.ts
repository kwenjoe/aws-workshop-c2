
import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

import * as asg from '@aws-cdk/aws-autoscaling'
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Ec2Service } from '@aws-cdk/aws-ecs';


export interface redisServiceProps {
    readonly efsId : string
    readonly HostCluster: ecs.ICluster
    
}


export class redisService extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: redisServiceProps) {
        super(scope, id)

        
       
        
        const redisTask = new ecs.FargateTaskDefinition(this , 'redisTask'  ,
            {
                cpu:256,
                memoryLimitMiB:512,               
            }
        )
        redisTask.addVolume({
            name: 'data',
            efsVolumeConfiguration:{
                fileSystemId: props.efsId,
                rootDirectory: "/"
            }            
        })

        

        redisTask.addContainer(
            'redisContainer' , {
                image:ecs.ContainerImage.fromRegistry("redis:latest"),                
                portMappings:[
                    {
                        containerPort:6379,
                        hostPort:6379
                    }
                ],             
            }
        ).addMountPoints(
            {
                containerPath:"/data",
                sourceVolume: "data",
                readOnly: false            
            }
        )

        const nlb = new elbv2.NetworkLoadBalancer(this, "RedisNLB", {
            vpc: props.HostCluster.vpc,
            internetFacing : true
        });

        const service = new ecs.FargateService(this , 'redisService' , {
         
            taskDefinition: redisTask   ,
            cluster: props.HostCluster ,
            
          
            
        })

        const listener = nlb.addListener("Listener", { 
            
            port: 6379 }
        );


      

        const ntg = new elbv2.NetworkTargetGroup(this , "tg" ,{
            port : 6379,            
            targetType: elbv2.TargetType.IP,
            vpc: props.HostCluster.vpc
        })

        service.attachToNetworkTargetGroup(ntg);
        listener.addTargetGroups("tg" , ntg)



 

    }
}
