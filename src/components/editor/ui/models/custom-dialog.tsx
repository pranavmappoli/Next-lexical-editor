'use client';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const DialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  variants: Variants;
  transition?: Transition;
  ids: {
    dialog: string;
    title: string;
    description: string;
  };
  onAnimationComplete: (definition: string) => void;
  handleTrigger: () => void;
} | null>(null);

const defaultVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
};

const defaultTransition: Transition = {
  ease: 'easeOut',
  duration: 0.2,
};

type DialogProps = {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  className?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function Dialog({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  defaultOpen,
  onOpenChange,
  open,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen || false
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isOpen = open !== undefined ? open : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (value: boolean) => {
      // Update the uncontrolled state if `open` is not provided
      if (open === undefined) {
        setUncontrolledOpen(value);
      }
      // Notify the parent component of the state change
      onOpenChange?.(value);
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      dialog.showModal();
    } else {
      document.body.classList.remove('overflow-hidden');
      dialog.close();
    }

    const handleCancel = (e: Event) => {
      e.preventDefault();
      setIsOpen(false);
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, setIsOpen]);

  const handleTrigger = () => {
    setIsOpen(true);
  };

  const onAnimationComplete = (definition: string) => {
    if (definition === 'exit' && !isOpen) {
      dialogRef.current?.close();
    }
  };

  const baseId = useId();
  const ids = {
    dialog: `motion-ui-dialog-${baseId}`,
    title: `motion-ui-dialog-title-${baseId}`,
    description: `motion-ui-dialog-description-${baseId}`,
  };



  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        dialogRef,
        variants,
        transition,
        ids,
        onAnimationComplete,
        handleTrigger,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogTrigger({ children, className }: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  return (
    <button
      onClick={context.handleTrigger}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

type DialogPortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | null;
};

function DialogPortal({ children }: DialogPortalProps) {
  if (typeof window !== "undefined") {
    return createPortal(children, document.body);
  }
}

type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
  container?: HTMLElement;
};

function DialogContent({ children, className, container }: DialogContentProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within Dialog');
  const {
    isOpen,
    setIsOpen,
    dialogRef,
    variants,
    transition,
    ids,
    onAnimationComplete,
  } = context;

  const content = (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.dialog
          key={ids.dialog}
          ref={dialogRef as React.RefObject<HTMLDialogElement>}
          id={ids.dialog}
          aria-labelledby={ids.title}
          aria-describedby={ids.description}
          aria-modal='true'
          role='dialog'
          onClick={(e: React.MouseEvent<HTMLDialogElement>) => {
            if (e.target === dialogRef.current) {
              setIsOpen(false);
            }
          }}
          initial='initial'
          animate='animate'
          exit='exit'
          variants={variants}
          transition={transition}
          onAnimationComplete={onAnimationComplete}
          className={cn(
            'fixed rounded-lg border z-[40] border-zinc-200 p-0 shadow-lg dark:border dark:border-zinc-700',
            'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
            'open:flex open:flex-col',
            className
          )}
        >
          <div className='w-full'>{children}</div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );

  return <DialogPortal container={container}>{content}</DialogPortal>;
}

type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-0', className)}>{children}</div>
  );
}

type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogTitle({ children, className }: DialogTitleProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTitle must be used within Dialog');

  return (
    <h2
      id={context.ids.title}
      className={cn('text-base font-medium', className)}
    >
      {children}
    </h2>
  );
}

type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogDescription({ children, className }: DialogDescriptionProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogDescription must be used within Dialog');

  return (
    <p
      id={context.ids.description}
      className={cn('text-base text-zinc-500', className)}
    >
      {children}
    </p>
  );
}

type DialogCloseProps = {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

function DialogClose({ className, children, disabled }: DialogCloseProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogClose must be used within Dialog');

  return (
    <button
      onClick={() => context.setIsOpen(false)}
      type='button'
      aria-label='Close dialog'
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity',
        'hover:opacity-100 focus:outline-none focus:ring-2',
        'focus:ring-zinc-500 focus:ring-offset-2 disabled:pointer-events-none',
        className
      )}
      disabled={disabled}
    >
      {children || <X className='h-4 w-4' />}
      <span className='sr-only'>Close</span>
    </button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
