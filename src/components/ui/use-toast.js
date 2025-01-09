export const useToast = () => {
    const toast = (options) => {
        // Aquí puedes implementar la lógica de notificación que prefieras
        console.log('Toast:', options);
    };
    return { toast };
};
