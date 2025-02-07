import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label
} from "recharts";
import analyticData from "./analytic_data.json";
import './Dashboard.scss';

export default function Histogram(){
  
  const [monthlydata,setmonthlydata]=useState([]);

  useEffect(()=>{
  const calculatetotalexpense=()=>{
    
    const months=Object.keys(analyticData.monthly_expenses)
    const data=months.map((month)=>{
      const expenses=Object.values(analyticData.monthly_expenses[month]);
      const total=expenses.reduce((acc, expense)=>acc+expense,0);
      return{
        Label:month,
        monthly_expenses: total,
      };
    });
   
 
    setmonthlydata(data);
  };

  calculatetotalexpense();


}, []);

    return(                            
  <BarChart width={630} height={350} data={monthlydata}>
    <XAxis dataKey="Label" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="monthly_expenses" fill="#08a045" />
  
  </BarChart>
    );
}