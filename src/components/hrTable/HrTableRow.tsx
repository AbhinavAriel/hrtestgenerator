import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { HrRow } from "../../types/hr";

interface Props {
  row: HrRow;
  onEdit?: (row: HrRow) => void;
  onDelete?: (row: HrRow) => void;
  onOpenTab?: (row: HrRow) => void;
  onRowClick?: (row: HrRow) => void;
}

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 640 640">
    <path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z" fill="#b59e00" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 640 640">
    <path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z" fill="#ff0000" />
  </svg>
);

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 640 640">
    <path d="M320 144C254.8 144 201.2 173.6 160.1 211.7C121.6 247.5 95 290 81.4 320C95 350 121.6 392.5 160.1 428.3C201.2 466.4 254.8 496 320 496C385.2 496 438.8 466.4 479.9 428.3C518.4 392.5 545 350 558.6 320C545 290 518.4 247.5 479.9 211.7C438.8 173.6 385.2 144 320 144zM127.4 176.6C174.5 132.8 239.2 96 320 96C400.8 96 465.5 132.8 512.6 176.6C559.4 220.1 590.7 272 605.6 307.7C608.9 315.6 608.9 324.4 605.6 332.3C590.7 368 559.4 420 512.6 463.4C465.5 507.1 400.8 544 320 544C239.2 544 174.5 507.2 127.4 463.4C80.6 419.9 49.3 368 34.4 332.3C31.1 324.4 31.1 315.6 34.4 307.7C49.3 272 80.6 220 127.4 176.6zM320 400C364.2 400 400 364.2 400 320C400 290.4 383.9 264.5 360 250.7C358.6 310.4 310.4 358.6 250.7 360C264.5 383.9 290.4 400 320 400zM240.4 311.6C242.9 311.9 245.4 312 248 312C283.3 312 312 283.3 312 248C312 245.4 311.8 242.9 311.6 240.4C274.2 244.3 244.4 274.1 240.5 311.5zM286 196.6C296.8 193.6 308.2 192.1 319.9 192.1C328.7 192.1 337.4 193 345.7 194.7C404.4 207.1 447.9 258.6 447.9 320.1C447.9 390.8 390.6 448.1 319.9 448.1C258.3 448.1 206.9 404.6 194.7 346.7C192.9 338.1 191.9 329.2 191.9 320.1C191.9 309.1 193.3 298.3 195.9 288.1C208.3 242.8 242.5 208.6 285.9 196.7z" fill="#432dd7" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 640 640">
    <path d="M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z" fill="#008ce1" />
  </svg>
);

export default function HrTableRow({ row, onEdit, onDelete, onRowClick }: Props) {
  const navigate = useNavigate();

  const isSubmitted = row.status?.toLowerCase() === "submitted";

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = String(row.testToken ?? "").trim();
      if (!token) throw new Error("Missing test token");
      await navigator.clipboard.writeText(`${window.location.origin}/test/${token}`);
      toast.success("Test link copied!");
    } catch (err: any) {
      toast.error(err?.message || "Unable to copy link");
    }
  };

  return (
    <tr
      onClick={() => onRowClick?.(row)}
      className="border-b border-gray-100 text-center hover:bg-gray-200 cursor-pointer"
    >
      <td className="px-3 py-4 text-gray-700">{row.serialNo}</td>

      <td className="p-4">
        <div className="font-semibold text-gray-900">{row.applicantName}</div>
        <div className="text-xs text-gray-600">{row.email}</div>
      </td>

      <td className="p-4">
        <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">
          {row.level}
        </span>
      </td>

      <td className="p-4">{row.totalQuestions}</td>

      <td className="p-4">{row.durationMinutes} min.</td>

      <td className="p-4 capitalize">{row.status || "-"}</td>

      <td className="p-4">{isSubmitted ? row.answeredCount : "-"}</td>

      <td className="p-4">{isSubmitted ? row.correctCount : "-"}</td>

      <td className="p-4">
        {isSubmitted ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              row.isRejected
                ? "bg-orange-100 text-orange-700"
                : row.isPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {row.isRejected ? "Rejected" : row.isPassed ? "Passed" : "Failed"}
          </span>
        ) : "-"}
      </td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-1.5">

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
            className="rounded-md cursor-pointer px-2 py-2 text-xs bg-yellow-100"
          >
            <EditIcon />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete?.(row); }}
            className="rounded-md bg-red-100 px-2 py-2 cursor-pointer text-xs"
          >
            <DeleteIcon />
          </button>

          {isSubmitted ? (
            <button
              type="button"
              disabled={!row.testId}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/hr/tests/${row.testId}/preview`);
              }}
              className="rounded-md bg-indigo-100 cursor-pointer px-2 py-2 text-xs disabled:opacity-50"
            >
              <ViewIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-md bg-blue-100 cursor-pointer px-2 py-2"
            >
              <CopyIcon />
            </button>
          )}

        </div>
      </td>
    </tr>
  );
}