import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CodeChange } from '../../models';

@Component({
  selector: 'app-auto-fix-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auto-fix-preview-dialog.component.html',
  styleUrl: './auto-fix-preview-dialog.component.scss',
})
export class AutoFixPreviewDialogComponent {
  private dialogRef = inject(MatDialogRef<AutoFixPreviewDialogComponent>);

  explanation: string = '';
  changes: CodeChange[] = [];
  isSubmitting = signal(false);

  /**
   * Called when the user clicks "Cancel"
   */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /**
   * Called when the user clicks "Accept"
   */
  onAccept(): void {
    this.isSubmitting.set(true);
    this.dialogRef.close({ accepted: true, changes: this.changes });
  }
}

