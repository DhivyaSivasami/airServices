'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const successCode =200;
const failureCode = 404;
const successMsg ='SUCCESS';

module.exports.hello = async (event,context) => {
  console.log("----------------------");
  console.log(event);
  console.log("----------------------");
  console.log(context);
  console.log("----------------------");
  let data = '';
  let flightStatus;
  
  //const req = JSON.parse(event.body);
  if(event.resource =='/getFlightDetail')
  {
    try
    {
      let eligible ='NA';
      let d = event.queryStringParameters.flightDEtaisl;
      console.log(JSON.stringify(d))
      console.log("inside get Flight Datta");
      const data =await getFlightDetails(event);
      console.log(data);
      flightStatus = data?.Item?.flightStatus;
      console.log(data?.Item != null)
      if( data?.Item != null)
      {
        console.log("insdie if")
        eligible = await checkRefundStatus(flightStatus,data)
      }
     else
     {
      console.log("inside else");
     }
      console.log("eligible"+eligible);
      return getResponse(successMsg,successCode,"Data Executed Successfully",eligible);
    }
    catch(Error)
    {
      console.log(Error);
      
    }

  }
  if(event.resource =='/getLoginDetail')
  {
    
    const data =await getLoginDetails(event);
    return getResponse(successMsg,successCode,"Data Executed Successfully",'b');
  }
};
const checkRefundStatus = async(flightStatus,data) =>
{
  if(flightStatus === '')
  {
    return await checkIsDelaylessThan3Hours(data?.Item?.scheduledArrival,data?.Item?.actualArrival);
  }
  else if(flightStatus === 'Cancelled')
  {
   return 'A'
  }
  else if(flightStatus === 'Delayed')
  {
   return 'A'
  }
 
}
const checkIsDelaylessThan3Hours  = async(scheduledArrival,actualArrival) =>
{
  console.log("scheduledArrival"+scheduledArrival);
  console.log("Actual Arrival"+actualArrival)

  let date = new Date(scheduledArrival);
  let now = new Date(actualArrival);
  console.log("date"+date);
  console.log("now"+now)
  let diffInMS = now - date;
  let msInHour = Math.abs(Math.floor(diffInMS/1000/60));
  console.log("Date"+date);
  console.log(now);
  console.log(msInHour);
  if (msInHour < 180) {
    return  'A'
  } 
 // console.log("Eligibke Status"+eligible);
  return 'NA';
}
const getLoginDetails = async(event,context) =>
{
  console.log("inside login");
  return 'A';
}
const getFlightDetails = async(event) =>
{
  console.log("inside flight details method");
  try
  {
	  const params ={
    TableName:process.env.TableName,
    Key:
    {
      "flightId":event.queryStringParameters.flightNum,
      "departDate" :event.queryStringParameters.depDate
    }
  };
  console.log(params);
  return await ddb.get(params).promise();
}
catch(Error)
{
  console.log(Error);
}
}
function getResponse(status,code,msgTxt,response)
  {
  return {
  statusCode:code,
  headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  body: JSON.stringify(response),
};
  }
