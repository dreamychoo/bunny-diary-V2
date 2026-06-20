#!/usr/bin/env python3
from __future__ import annotations

import platform
import subprocess
import sys
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from extract_nonwhite_regions import ExtractionOptions, extract_assets  # noqa: E402


def open_folder(path: Path) -> None:
    system = platform.system()
    try:
        if system == "Darwin":
            subprocess.Popen(["open", str(path)])
        elif system == "Windows":
            subprocess.Popen(["explorer", str(path)])
        else:
            subprocess.Popen(["xdg-open", str(path)])
    except Exception:
        pass


class App:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Bunny Garden Asset Extractor")
        self.root.geometry("680x620")
        self.root.minsize(680, 620)
        self.bg = "#f6f2ea"
        self.fg = "#3f332d"
        self.entry_bg = "#ffffff"
        self.image_path = tk.StringVar(value="还没有选择图片")
        self.status_text = tk.StringVar(value="请选择一张素材总表。")

        self.white_threshold = tk.IntVar(value=245)
        self.min_area = tk.IntVar(value=1200)
        self.padding = tk.IntVar(value=8)
        self.erode = tk.IntVar(value=1)
        self.feather = tk.DoubleVar(value=0.8)

        self.build_ui()

    def build_ui(self) -> None:
        self.root.configure(bg=self.bg)

        main_frame = tk.Frame(self.root, padx=20, pady=20, bg=self.bg)
        main_frame.pack(fill="both", expand=True)

        title_label = tk.Label(
            main_frame,
            text="Bunny Garden 素材提取器",
            font=("Arial", 18, "bold"),
            bg=self.bg,
            fg=self.fg,
            anchor="w",
        )
        title_label.pack(fill="x", pady=(0, 16))

        intro_label = tk.Label(
            main_frame,
            text="选择一张素材图，再调参数，然后点击开始提取素材。",
            bg=self.bg,
            fg=self.fg,
            anchor="w",
            justify="left",
        )
        intro_label.pack(fill="x", pady=(0, 14))

        select_button = tk.Button(
            main_frame,
            text="选择图片",
            command=self.choose_image,
            bg="#ffffff",
            fg=self.fg,
            padx=12,
            pady=8,
        )
        select_button.pack(fill="x", pady=(0, 10))

        path_title = tk.Label(
            main_frame,
            text="图片路径",
            font=("Arial", 12, "bold"),
            bg=self.bg,
            fg=self.fg,
            anchor="w",
        )
        path_title.pack(fill="x")

        path_label = tk.Label(
            main_frame,
            textvariable=self.image_path,
            text="还没有选择图片",
            bg=self.entry_bg,
            fg=self.fg,
            anchor="w",
            justify="left",
            wraplength=580,
            relief="sunken",
            bd=1,
            padx=10,
            pady=10,
            height=3,
        )
        path_label.pack(fill="x", pady=(6, 16))

        self.add_number_field(main_frame, "white_threshold", self.white_threshold)
        self.add_number_field(main_frame, "min_area", self.min_area)
        self.add_number_field(main_frame, "padding", self.padding)
        self.add_number_field(main_frame, "erode", self.erode)
        self.add_number_field(main_frame, "feather", self.feather)

        run_button = tk.Button(
            main_frame,
            text="开始提取素材",
            command=self.run_extraction,
            bg="#ffffff",
            fg=self.fg,
            padx=12,
            pady=10,
        )
        run_button.pack(fill="x", pady=(18, 10))

        status_label = tk.Label(
            main_frame,
            textvariable=self.status_text,
            bg=self.bg,
            fg=self.fg,
            anchor="w",
            justify="left",
            wraplength=620,
        )
        status_label.pack(fill="x", pady=(6, 0))

    def add_number_field(self, parent: tk.Widget, label_text: str, variable: tk.Variable) -> None:
        row = tk.Frame(parent, bg=self.bg)
        row.pack(fill="x", pady=(0, 12))

        label = tk.Label(row, text=label_text, anchor="w", width=18, bg=self.bg, fg=self.fg)
        label.pack(fill="x", pady=(0, 4))

        entry = tk.Entry(row, textvariable=variable, bg=self.entry_bg, fg=self.fg, insertbackground=self.fg)
        entry.pack(fill="x", ipady=6)

    def choose_image(self) -> None:
        filename = filedialog.askopenfilename(
            title="选择素材图",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.webp"), ("All files", "*.*")],
        )
        if filename:
            self.image_path.set(filename)
            self.status_text.set("参数确认后，点击“开始提取素材”。")
            self.root.update_idletasks()

    def run_extraction(self) -> None:
        raw_path = self.image_path.get().strip()
        if not raw_path:
            messagebox.showerror("缺少图片", "先选一张图片。")
            return

        input_path = Path(raw_path).expanduser()
        if not input_path.exists():
            messagebox.showerror("图片不存在", f"找不到文件：\n{input_path}")
            return

        try:
            options = ExtractionOptions(
                white_threshold=int(self.white_threshold.get()),
                min_area=float(self.min_area.get()),
                padding=int(self.padding.get()),
                erode=int(self.erode.get()),
                feather=float(self.feather.get()),
                save_preview=True,
            )
            exported_paths, _boxes, output_dir, preview_path = extract_assets(input_path, options)
        except Exception as exc:
            messagebox.showerror("提取失败", str(exc))
            self.status_text.set("提取失败，请调低 min_area 或调高 white_threshold。")
            return

        open_folder(output_dir)
        preview_note = f"\n预览图：{preview_path.name}" if preview_path else ""
        messagebox.showinfo("提取完成", f"已导出 {len(exported_paths)} 个素材。\n输出目录：\n{output_dir}{preview_note}")
        self.status_text.set(f"完成：导出 {len(exported_paths)} 个素材。输出目录已打开。")


def main() -> int:
    root = tk.Tk()
    App(root)
    root.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
