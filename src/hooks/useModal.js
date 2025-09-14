import { useState, useCallback } from 'react';

const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCloseButton: true
  });

  const showModal = useCallback(({
    title,
    message,
    type = 'info',
    buttons = [],
    showCloseButton = true
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      buttons,
      showCloseButton
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Métodos de conveniencia para tipos específicos
  const showSuccess = useCallback((title, message, buttons) => {
    showModal({
      title,
      message,
      type: 'success',
      buttons: buttons || [
        {
          text: 'Aceptar',
          variant: 'success',
          onClick: hideModal
        }
      ]
    });
  }, [showModal, hideModal]);

  const showError = useCallback((title, message, buttons) => {
    showModal({
      title,
      message,
      type: 'error',
      buttons: buttons || [
        {
          text: 'Aceptar',
          variant: 'error',
          onClick: hideModal
        }
      ]
    });
  }, [showModal, hideModal]);

  const showWarning = useCallback((title, message, buttons) => {
    showModal({
      title,
      message,
      type: 'warning',
      buttons: buttons || [
        {
          text: 'Aceptar',
          variant: 'primary',
          onClick: hideModal
        }
      ]
    });
  }, [showModal, hideModal]);

  const showInfo = useCallback((title, message, buttons) => {
    showModal({
      title,
      message,
      type: 'info',
      buttons: buttons || [
        {
          text: 'Aceptar',
          variant: 'primary',
          onClick: hideModal
        }
      ]
    });
  }, [showModal, hideModal]);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    showModal({
      title,
      message,
      type: 'warning',
      buttons: [
        {
          text: 'Cancelar',
          variant: 'outline',
          onClick: () => {
            hideModal();
            if (onCancel) onCancel();
          }
        },
        {
          text: 'Confirmar',
          variant: 'primary',
          onClick: () => {
            hideModal();
            if (onConfirm) onConfirm();
          }
        }
      ]
    });
  }, [showModal, hideModal]);

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};

export default useModal;
