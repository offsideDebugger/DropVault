"use client"
import { useState } from "react";
import axios from "axios";
export default function FileForm() {
    const [file, setFile] = useState<File | null>(null);
    const [expiry, setExpiry] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [url,setUrl]=useState<string|null>(null)
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
        setFile(file)
        }
    }

    const SubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setError("No file selected");
            return;
        }
        if(file.size>20 * 1024 * 1024){
            setError("File size should be less than 20MB");
            return;
        }
        if (!expiry) {
            setError("No expiry selected");
            return;
        }
        if (!password) {
            setError("No password selected");
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expiry', expiry);
        formData.append('password', password);

        try {
            const res = await axios.post("http://localhost:3000/api/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const success = res.data.success;
            if(success){
                setUrl(res.data.url);
            }
        } catch (err: any) {
            const apiError = err.response?.data;
            if (typeof apiError === 'string') {
                setError(apiError);
            } else if (apiError && typeof apiError.error === 'string') {
                setError(apiError.error);
            } else if (apiError && typeof apiError.message === 'string') {
                setError(apiError.message);
            } else {
                setError('Upload failed');
            }
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="flex flex-col items-center justify-center ">
                <div className="w-full max-w-sm p-5 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 mt-50">
                <form onSubmit={SubmitHandler}>
                
                <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload file upto 20 MB:</label>
                        <input className="block w-full text-sm text-gray-900 border p-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="user_avatar_help" onChange={handleFileChange} id="user_avatar" type="file"/>
                </div>
                    
                    <div className="max-w-sm mx-auto mb-5">
                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select file expiry:</label>
                    <select id="countries" onChange={(e) => setExpiry(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option>15 mins</option>
                        <option>30 mins</option>
                        <option>1 hour</option>
                        <option>6 hours</option>
                        <option>12 hours</option>
                        <option>24 hours</option>

                    </select>

                        
                    </div>
                    <div className="mb-5">
                        <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Password:</label>
                        <input type="text" id="base-input" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                    </div>
                    <div className="mt-8 flex justify-center mr-5">
                        <button type="submit" className=" rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300">Upload</button>
                    </div>
                </form>
                    <div className="mt-5 flex justify-center ">
                    {error && <p className="text-red-500">{error}</p>}
                    {url && <p className="text-green-500"><a href={url}>{url}</a></p>}
                    </div>
                </div>
            </div>
        </div>
    );
}