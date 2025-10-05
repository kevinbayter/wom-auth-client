import { test, expect } from '@playwright/test';

test.describe('Autenticación - Usuario Bloqueado', () => {
  test('debe mostrar mensaje de cuenta bloqueada para usuario locked', async ({ page }) => {
    // Mock de respuesta HTTP para simular usuario bloqueado
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Cuenta bloqueada temporalmente',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
        })
      });
    });

    // Navegar a la página de login
    await page.goto('/auth/login');

    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*login/);

    // Intentar login con usuario bloqueado
    await page.fill('input[formControlName="identifier"]', 'locked@test.com');
    await page.fill('input[formControlName="password"]', 'password');

    // Hacer clic en el botón de login
    await page.click('button[type="submit"]');

    // Esperar un poco para que se procese la respuesta
    await page.waitForTimeout(500);

    // Debería mostrar mensaje de cuenta bloqueada
    await expect(page.locator('text=/cuenta bloqueada/i')).toBeVisible();

    // El formulario debería estar deshabilitado o mostrar mensaje de error
    const errorMessage = page.locator('.error-alert, .mat-mdc-snack-bar-container, [role="alert"]');
    await expect(errorMessage).toBeVisible();

    // Tomar screenshot como evidencia adicional
    await page.screenshot({
      path: 'pruebas/usuario_bloqueado.png',
      fullPage: true
    });
  });
});