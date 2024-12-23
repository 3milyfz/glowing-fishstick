import { ReportFormat } from "@/constants/constants";

interface ReportProps {
  report: ReportFormat;
}

export default function Report({ report }: ReportProps) {
  // console.log(report)
  return (
    <div className="ml-6 flex flex-col items-left text-red-400 text-red border-l border-solid border-black dark:border-white p-2 rounded-lg">
      <div className="w-[100%] flex items-left">
        <p className="">@{report.reporterUsername}</p>
      </div>
      <hr className="dark:border-white border-black"></hr>
      <p className="mt-2 text-xl">Report reason: {report.reason}</p>
    </div>
  );
}
