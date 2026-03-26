use reqwest::blocking::get;
use std::fs::File;
use std::{fs, io::Write, path::Path};
use zip::ZipArchive;

#[tauri::command]
pub fn check_rbri18n_install_status(rbr_install_path: String) -> Result<String, String> {
    if !fs::exists(rbr_install_path.clone()).map_err(|e| e.to_string())? {
        return Ok("安装目录不正确".to_string());
    }
    let rbr_exe_path = rbr_install_path.clone() + "/richardburnsrally.exe";
    if !fs::exists(rbr_exe_path.clone()).map_err(|e| e.to_string())? {
        return Ok("安装目录不正确".to_string());
    }
    let plugin_path = format!("{}/Plugins/RBRi18n.dll", rbr_install_path.clone());
    if !fs::exists(plugin_path).map_err(|e| e.to_string())? {
        return Ok("未安装".to_string());
    }

    Ok("已安装".to_string())
}

#[tauri::command]
pub async fn install_rbri18n(rbr_install_path: String, zip_file_url: String) -> Result<(), String> {
    // 1. 下载.zip压缩包
    let response = get(&zip_file_url).map_err(|e| format!("下载文件时出错: {}", e))?;
    if !response.status().is_success() {
        return Err(format!("下载文件失败，状态码: {}", response.status()));
    }

    let zip_file = rbr_install_path.clone() + "/rbri18n.zip";
    if fs::exists(zip_file.clone()).map_err(|e| e.to_string())? {
        fs::remove_file(zip_file.clone()).map_err(|e| format!("删除旧压缩包时出错: {}", e))?;
    }
    let mut dest = File::create(&zip_file).map_err(|e| format!("创建文件时出错: {}", e))?;
    let content = response
        .bytes()
        .map_err(|e| format!("读取响应内容时出错: {}", e))?;
    dest.write_all(&content)
        .map_err(|e| format!("写入文件时出错: {}", e))?;

    // 2. 解压.zip压缩包
    let file = File::open(&zip_file).map_err(|e| format!("打开文件时出错: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("创建归档文件时出错: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("获取归档文件时出错: {}", e))?;
        let outpath = match file.enclosed_name() {
            Some(path) => rbr_install_path.clone() + "/" + path.to_string_lossy().as_ref(),
            None => continue,
        };

        if file.is_dir() {
            // 创建目录
            std::fs::create_dir_all(&outpath).map_err(|e| format!("创建目录时出错: {}", e))?;
        } else {
            // 创建文件
            if let Some(parent) = Path::new(&outpath).parent() {
                std::fs::create_dir_all(parent).map_err(|e| format!("创建目录时出错: {}", e))?;
            }
            let mut outfile =
                File::create(&outpath).map_err(|e| format!("创建目录时出错: {}", e))?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| format!("创建目录时出错: {}", e))?;
        }
    }

    Ok(())
}
