export default function NotFound() {
    return (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white p-8 dark:bg-black">
            <div className="text-center space-y-5">
                <h1 className="text-5xl font-bold text-red-600">404 - Not Found</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400">The page you are looking for does not exist.</p>
            </div>
        </div>
    );
}
