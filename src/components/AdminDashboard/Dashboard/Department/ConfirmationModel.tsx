import type { ConfirmationModalProps } from "../../../Types/type";


export default function ConfirmationModal({ message, onClose, onConfirm }: ConfirmationModalProps) {
    return (
        <div className="fixed inset-0 bg-white-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto transform transition-all">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150"
                    >
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
    );
}