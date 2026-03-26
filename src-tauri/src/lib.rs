mod file_log;
mod path_utils;
mod rbri18n_installer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    file_log::init().expect("Failed to initialize log file");
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            file_log::log_debug,
            file_log::log_info,
            file_log::log_warn,
            file_log::log_error,
            rbri18n_installer::check_rbri18n_install_status,
            rbri18n_installer::install_rbri18n
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
