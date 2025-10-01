export interface WindowSize {
	width: number;
	height: number;
}

export interface AppMetadata {
	/** Application name */
	appName: string;
	/** Application title */
	title: string;
	/** Default window size */
	defaultSize: WindowSize;
	/** Icon identifier */
	icon?: string;
	/** Application category */
	category?: string;
	/** Whether multiple instances are allowed */
	allowMultiple?: boolean;
	/** Default window position mode */
	defaultPosition?: 'center' | 'cascade' | 'custom';
	/** Custom default position if mode is 'custom' */
	//customPosition?: WindowPosition;
	/** Minimum window size */
	minSize?: WindowSize;
	/** Maximum window size */
	maxSize?: WindowSize;
	/** Whether window is resizable */
	resizable?: boolean;
	/** Whether window can be maximized */
	maximizable?: boolean;
	/** Whether window can be minimized */
	minimizable?: boolean;
}
