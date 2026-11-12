/**
 * 安全区域工具类
 * 提供统一的安全区域计算和管理功能
 */

class SafeAreaManager {
	constructor() {
		this.systemInfo = null;
		this.statusBarHeight = 0;
		this.navBarHeight = 44; // 默认导航栏高度
		this.searchBarHeight = 0;
		this.init();
	}
	
	// 初始化系统信息
	init() {
		try {
			this.systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
			this.searchBarHeight = uni.upx2px(70); // 搜索栏高度
			
			console.log('SafeAreaManager 初始化完成:', {
				statusBarHeight: this.statusBarHeight,
				navBarHeight: this.navBarHeight,
				searchBarHeight: this.searchBarHeight,
				safeAreaInsets: this.systemInfo.safeAreaInsets
			});
		} catch (error) {
			console.error('SafeAreaManager 初始化失败:', error);
			// 使用默认值
			this.statusBarHeight = 20;
			this.navBarHeight = 44;
		}
	}
	
	// 计算安全区域高度
	calculateSafeAreaHeight(options = {}) {
		const {
			includeStatusBar = true,
			includeNavBar = true,
			includeSearchBar = false,
			topOffset = 0,
			bottomOffset = 0
		} = options;
		
		let top = 0;
		
		if (includeStatusBar) {
			top += this.statusBarHeight;
		}
		
		if (includeNavBar) {
			top += this.navBarHeight;
		}
		
		if (includeSearchBar) {
			top += this.searchBarHeight;
		}
		
		top += topOffset;
		
		let bottom = bottomOffset;
		if (this.systemInfo && this.systemInfo.safeAreaInsets) {
			bottom += this.systemInfo.safeAreaInsets.bottom;
		}
		
		return {
			top,
			bottom,
			total: top + bottom
		};
	}
	
	// 获取状态栏高度
	getStatusBarHeight() {
		return this.statusBarHeight;
	}
	
	// 获取导航栏高度
	getNavBarHeight() {
		return this.navBarHeight;
	}
	
	// 获取搜索栏高度
	getSearchBarHeight() {
		return this.searchBarHeight;
	}
	
	// 更新搜索栏高度
	updateSearchBarHeight(height) {
		this.searchBarHeight = height;
	}
	
	// 获取底部安全区域高度
	getBottomSafeAreaHeight() {
		if (this.systemInfo && this.systemInfo.safeAreaInsets) {
			return this.systemInfo.safeAreaInsets.bottom;
		}
		return 0;
	}
	
	// 获取系统信息
	getSystemInfo() {
		return this.systemInfo;
	}
	
	// 重新初始化（用于系统信息变化时）
	reinit() {
		this.init();
	}
}

// 创建单例实例
const safeAreaManager = new SafeAreaManager();

// 导出工具函数
export const getSafeAreaHeight = (options) => {
	return safeAreaManager.calculateSafeAreaHeight(options);
};

export const getStatusBarHeight = () => {
	return safeAreaManager.getStatusBarHeight();
};

export const getNavBarHeight = () => {
	return safeAreaManager.getNavBarHeight();
};

export const getSearchBarHeight = () => {
	return safeAreaManager.getSearchBarHeight();
};

export const updateSearchBarHeight = (height) => {
	return safeAreaManager.updateSearchBarHeight(height);
};

export const getBottomSafeAreaHeight = () => {
	return safeAreaManager.getBottomSafeAreaHeight();
};

export const getSystemInfo = () => {
	return safeAreaManager.getSystemInfo();
};

export const reinitSafeArea = () => {
	return safeAreaManager.reinit();
};

// 导出管理器实例
export default safeAreaManager;
