"use client";
import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import "./Reportpage.css";
import { AiFillEdit } from "react-icons/ai";
import CaloriIntakePopup from "@/app/components/ReportFormPopup/CalorieIntake/CalorieIntakePopup";

const Page = () => {
  const color = "#ffc20e";
  const chartsParams = {
    height: 300,
  };

  const [dataS1, setDataS1] = React.useState<{
    data: number[];
    title: string;
    color: string;
    xAxis: {
      data: number[];
      label: string;
      scaleType: "time" | "linear";
    };
  } | null>(null);

  // Function to fetch and process data for the line chart
  const getDataForS1 = async () => {
    const temp = [
      { date: "Thu Sep 28 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2000, unit: "kcal" },
      { date: "Wed Sep 27 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2500, unit: "kcal" },
      { date: "Tue Sep 26 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2700, unit: "kcal" },
      { date: "Mon Sep 25 2023 20:30:30 GMT+0530 (India Standard Time)", value: 3000, unit: "kcal" },
      { date: "Sun Sep 24 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2000, unit: "kcal" },
      { date: "Sat Sep 23 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2300, unit: "kcal" },
      { date: "Fri Sep 22 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2500, unit: "kcal" },
      { date: "Thu Sep 21 2023 20:30:30 GMT+0530 (India Standard Time)", value: 2700, unit: "kcal" },
    ];

    // Convert data for the line chart
    const dataForLineChart = temp.map((item) => item.value); // Y-axis data (numeric)

    // Convert dates to timestamps (milliseconds since epoch)
    const dataForXAxis = temp.map((item) => new Date(item.date).getTime());

    // Set the state with formatted data
    setDataS1({
      data: dataForLineChart,
      title: "1 Day Calorie Intake",
      color: color,
      xAxis: {
        data: dataForXAxis, // Use timestamps for the X-axis
        label: "Last 10 Days",
        scaleType: "time",
      },
    });
  };

  // Fetch data when component mounts
  React.useEffect(() => {
    getDataForS1();
  }, []);

  // State to handle the visibility of the popup
  const [showCalorieIntakePopup, setShowCalorieIntakePopup] = React.useState<boolean>(false);

  // Render LineChart component
  const renderLineChart = () =>
    dataS1 && (
      <LineChart
        xAxis={[
          {
            id: "Day",
            data: dataS1.xAxis.data, // Array of timestamps
            scaleType: dataS1.xAxis.scaleType,
            label: dataS1.xAxis.label,
            valueFormatter: (timestamp: number) => {
              const date = new Date(timestamp);
              return `${date.getDate()}/${date.getMonth() + 1}`; // Format as "DD/MM"
            },
          },
        ]}
        series={[
          {
            data: dataS1.data,
            label: dataS1.title,
            color: dataS1.color,
          },
        ]}
        {...chartsParams}
      />
    );

  return (
    <div className="reportpage">
      {/* Four sections with the same line chart */}
      <div className="s1">{renderLineChart()}</div>
      <div className="s2">{renderLineChart()}</div>
      <div className="s3">{renderLineChart()}</div>
      <div className="s4">{renderLineChart()}</div>

      {/* Edit button to show the popup */}
      <button
        className="editbutton"
        onClick={() => setShowCalorieIntakePopup(true)}
      >
        <AiFillEdit />
      </button>

      {/* Calorie Intake Popup */}
      {showCalorieIntakePopup && (
        <CaloriIntakePopup setShowCalorieIntakePopup={setShowCalorieIntakePopup} />
      )}
    </div>
  );
};

export default Page;
