import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/auth/login_usecase.dart';
import '../../../domain/usecases/auth/register_usecase.dart';
import '../../../domain/usecases/auth/logout_usecase.dart';
import '../../../domain/usecases/auth/check_auth_usecase.dart';
import '../../../domain/usecases/auth/get_cached_user_usecase.dart';
import '../../../domain/usecases/auth/login_with_google_usecase.dart';
import '../../../domain/usecases/auth/delete_account_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final CheckAuthUseCase checkAuthUseCase;
  final GetCachedUserUseCase getCachedUserUseCase;
  final LoginWithGoogleUseCase loginWithGoogleUseCase;
  final DeleteAccountUseCase deleteAccountUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.checkAuthUseCase,
    required this.getCachedUserUseCase,
    required this.loginWithGoogleUseCase,
    required this.deleteAccountUseCase,
  }) : super(AuthInitial()) {
    on<AuthCheckRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final cachedUser = await getCachedUserUseCase();
        if (cachedUser != null) {
          emit(AuthAuthenticated(cachedUser));
        } else {
          emit(AuthUnauthenticated());
        }
      } catch (_) {
        emit(AuthUnauthenticated());
      }
    });

    on<AuthLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await loginUseCase(event.email, event.password);
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthRegisterRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await registerUseCase(
          event.fullName,
          event.email,
          event.password,
        );
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthLogoutRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        await logoutUseCase();
      } catch (_) {}
      emit(AuthUnauthenticated());
    });

    on<AuthGoogleLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await loginWithGoogleUseCase();
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthDeleteAccountRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        await deleteAccountUseCase(event.userId);
        emit(AuthUnauthenticated());
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });
  }
}
