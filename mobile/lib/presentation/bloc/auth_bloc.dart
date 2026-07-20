import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/datasources/auth_data_source.dart';
import '../../data/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';


// --- Events ---
abstract class AuthEvent {}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  AuthLoginRequested(this.email, this.password);
}

class AuthRegisterRequested extends AuthEvent {
  final String fullName;
  final String email;
  final String password;
  AuthRegisterRequested({
    required this.fullName,
    required this.email,
    required this.password,
  });
}

class AuthLogoutRequested extends AuthEvent {}

class AuthGoogleLoginRequested extends AuthEvent {
  final String idToken;
  final String? fullName;
  AuthGoogleLoginRequested(this.idToken, {this.fullName});
}

class AuthDeleteAccountRequested extends AuthEvent {
  final int userId;
  AuthDeleteAccountRequested(this.userId);
}

// --- States ---
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String error;
  AuthFailure(this.error);
}

// --- Bloc ---
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthDataSource _authDataSource;

  AuthBloc(this._authDataSource) : super(AuthInitial()) {
    on<AuthCheckRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final authenticated = await _authDataSource.isAuthenticated();
        if (authenticated) {
          final prefs = await SharedPreferences.getInstance();
          final id = prefs.getInt('auth_user_id') ?? 1;
          final name = prefs.getString('auth_user_name') ?? 'Học viên VSL';
          final email = prefs.getString('auth_user_email') ?? '';
          final role = prefs.getString('auth_user_role') ?? 'learner';
          emit(AuthAuthenticated(UserModel(id: id, fullName: name, email: email, role: role)));
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
        final user = await _authDataSource.login(event.email, event.password);
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthRegisterRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await _authDataSource.register(
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
      await _authDataSource.logout();
      emit(AuthUnauthenticated());
    });

    on<AuthGoogleLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await _authDataSource.loginWithGoogle(event.idToken, fullName: event.fullName);
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<AuthDeleteAccountRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        await _authDataSource.deleteAccount(event.userId);
        await _authDataSource.logout();
        emit(AuthUnauthenticated());
      } catch (e) {
        emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });
  }
}
