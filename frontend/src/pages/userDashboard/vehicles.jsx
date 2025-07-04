
import React, { useEffect, useState } from 'react'
import SideBar from '@/components/user/SideBar'
import TopBar from '@/components/user/topbar'
import axios from 'axios'
import { MdOutlineDelete } from 'react-icons/md'
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import AddVehicleModal from '@/components/user/AddVehicleModal'

const Vehicle = () => {


    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://127.0.0.1:8000/api/vehicle/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status !== 200) {
                    throw new Error("Failed to fetch vehicles.");
                }

                setVehicles(response.data);
            } catch (error) {
                toast.error("Failed to fetch vehicles.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);


    const handleDeleteVehicle = async (vehicleId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/vehicle/user/${vehicleId}`);
            toast.success("Vehicle deleted successfully!");
            setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to delete vehicle.");
        }
    };

    const confirmDelete = () => {
        if (selectedVehicleId) {
            handleDeleteVehicle(selectedVehicleId);
            setSelectedVehicleId(null);
            const modal = document.getElementById("popup-modal");
            modal.classList.add("hidden");
        }
    };

    const handleSubmit = (formData) => {
        setVehicles((prev) => [...prev, { id: Date.now(), ...formData }]);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    return (
        <div className="bg-gray-100">
            <div className="flex h-screen">

                <SideBar />

                {/* Main Content */}
                <main className="flex-1 bg-gray-100">

                    <TopBar />

                    <div className="p-6">

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(true)}  // 👈 This opens the modal
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 mb-4"
                            >
                                Add Vehicle
                            </button>
                        </div>


                        <AddVehicleModal
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                            onSubmit={handleSubmit}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="text-center col-span-full py-6">
                                    <svg aria-hidden="true" class="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                </div>
                            ) : vehicles.length > 0 ? (
                                vehicles.map((v) => (
                                    <div key={v.id} className="bg-white border shadow rounded-xl overflow-hidden">
                                        {/* Header */}
                                        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
                                            <h2 className="text-lg font-semibold">{v.plate_number || "No Plate"}</h2>
                                            <button
                                                onClick={() => {
                                                    setSelectedVehicleId(v.id);
                                                    document.getElementById("popup-modal").classList.remove("hidden");
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <MdOutlineDelete size={20} />
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4 space-y-2">
                                            <p><strong>Brand:</strong> {v.vehicle_brand || "N/A"}</p>
                                            <p><strong>Model:</strong> {v.vehicle_model || "N/A"}</p>
                                            <p><strong>Color:</strong> {v.car_color || "N/A"}</p>
                                            <p><strong>Created:</strong> {v.created_at ? new Date(v.created_at).toLocaleString() : "N/A"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center col-span-full py-6">No vehicles found.</div>
                            )}
                        </div>


                    </div>

                    {/* Delete Modal */}
                    <div
                        id="popup-modal"
                        className="hidden overflow-y-auto overflow-x-hidden fixed flex z-50 justify-center items-center w-full h-full bg-black/60  md:inset-0 h-[calc(100%-1rem)] "
                    >
                        <div className="relative p-4 w-full max-w-md max-h-full">
                            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                <button
                                    type="button"
                                    className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => {
                                        const modal = document.getElementById("popup-modal");
                                        modal.classList.add("hidden");
                                    }}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="p-4 md:p-5 text-center">
                                    <svg
                                        className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                        Are you sure you want to delete this vehicle?
                                    </h3>
                                    <button
                                        onClick={confirmDelete}
                                        type="button"
                                        className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2"
                                    >
                                        Yes, I'm sure
                                    </button>

                                    <button
                                        onClick={() => {
                                            const modal = document.getElementById("popup-modal");
                                            modal.classList.add("hidden");
                                        }}
                                        type="button"
                                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    >
                                        No, cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    )
}

export default Vehicle